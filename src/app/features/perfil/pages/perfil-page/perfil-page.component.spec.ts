import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsuarioResponse } from '../../../../core/models/auth.model';
import { ContaResponse } from '../../../../core/models/conta.model';
import { CategoriaResponse } from '../../../../core/models/categoria.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ContaService } from '../../../../core/services/conta.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PerfilPageComponent } from './perfil-page.component';

describe('PerfilPageComponent', () => {
  let component: PerfilPageComponent;
  let fixture: ComponentFixture<PerfilPageComponent>;

  const usuarioMock: UsuarioResponse = {
    id: 'a0000000-0000-0000-0000-000000000001',
    nome: 'Mariana Silva',
    email: 'mariana@email.com',
    role: 'ROLE_USER',
    ativo: true,
    criadoEm: '2024-03-14T09:42:00',
  };

  const contasMock: ContaResponse[] = [
    {
      id: 'c1',
      nome: 'Conta Corrente',
      instituicao: 'Nubank',
      tipo: 'CONTA_CORRENTE',
      saldoInicial: 1000,
      ativa: true,
      criadoEm: '2024-03-14T10:00:00',
      atualizadoEm: '2024-03-14T10:00:00',
    },
    {
      id: 'c2',
      nome: 'Reserva Emergência',
      instituicao: 'Inter',
      tipo: 'POUPANCA',
      saldoInicial: 5000,
      ativa: true,
      criadoEm: '2024-03-14T10:00:00',
      atualizadoEm: '2024-03-14T10:00:00',
    },
    {
      id: 'c3',
      nome: 'Conta Inativa',
      instituicao: 'Bradesco',
      tipo: 'CONTA_CORRENTE',
      saldoInicial: 0,
      ativa: false,
      criadoEm: '2024-03-14T10:00:00',
      atualizadoEm: '2024-03-14T10:00:00',
    },
  ];

  const categoriasMock: CategoriaResponse[] = [
    {
      id: 'cat1',
      nome: 'Alimentação',
      descricao: 'Gastos com mercado e refeições',
      corHex: '#ef4444',
      tipo: 'DESPESA',
      ativa: true,
      criadoEm: '2024-03-14T10:00:00',
      atualizadoEm: '2024-03-14T10:00:00',
    },
    {
      id: 'cat2',
      nome: 'Salário',
      descricao: 'Remuneração mensal',
      corHex: '#34d399',
      tipo: 'RECEITA',
      ativa: true,
      criadoEm: '2024-03-14T10:00:00',
      atualizadoEm: '2024-03-14T10:00:00',
    },
  ];

  let authServiceSpy: {
    usuarioAtual: ReturnType<typeof vi.fn>;
    obterPerfil: ReturnType<typeof vi.fn>;
    atualizarPerfil: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let contaServiceSpy: {
    listarTodas: ReturnType<typeof vi.fn>;
  };
  let categoriaServiceSpy: {
    listarTodas: ReturnType<typeof vi.fn>;
  };
  let notificationSpy: {
    sucesso: ReturnType<typeof vi.fn>;
    erro: ReturnType<typeof vi.fn>;
    alerta: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceSpy = {
      usuarioAtual: vi.fn().mockReturnValue(usuarioMock),
      obterPerfil: vi.fn().mockReturnValue(of(usuarioMock)),
      atualizarPerfil: vi.fn().mockReturnValue(of({ ...usuarioMock, nome: 'Mariana Silva Alterada' })),
      logout: vi.fn(),
    };

    contaServiceSpy = {
      listarTodas: vi.fn().mockReturnValue(of(contasMock)),
    };

    categoriaServiceSpy = {
      listarTodas: vi.fn().mockReturnValue(of(categoriasMock)),
    };

    notificationSpy = {
      sucesso: vi.fn(),
      erro: vi.fn(),
      alerta: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PerfilPageComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ContaService, useValue: contaServiceSpy },
        { provide: CategoriaService, useValue: categoriaServiceSpy },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar e carregar dados cadastrais e métricas de escopo', () => {
    expect(component).toBeTruthy();
    expect(authServiceSpy.obterPerfil).toHaveBeenCalled();
    expect(contaServiceSpy.listarTodas).toHaveBeenCalled();
    expect(categoriaServiceSpy.listarTodas).toHaveBeenCalled();

    expect(component.contas().length).toBe(3);
    expect(component.contasAtivasCount()).toBe(2);
    expect(component.totalCategoriasCount()).toBe(2);
  });

  it('deve formatar corretamente as iniciais e a data de criação do membro', () => {
    expect(component.extrairIniciais('Mariana Silva')).toBe('MS');
    expect(component.extrairIniciais('Mariana')).toBe('MA');
    expect(component.extrairIniciais('')).toBe('US');

    expect(component.formatarMembroDesde('2024-03-14T09:42:00')).toBe('14/03/2024 às 09:42');
    expect(component.formatarMembroDesde(null)).toBe('Data não informada');
  });

  it('deve alternar para o modo de edição do nome e salvar alterações com sucesso', () => {
    expect(component.editandoNome()).toBe(false);

    component.iniciarEdicaoNome();
    expect(component.editandoNome()).toBe(true);
    expect(component.formNome.value.nome).toBe('Mariana Silva');

    component.formNome.patchValue({ nome: 'Mariana Silva Alterada' });
    component.salvarNome();

    expect(authServiceSpy.atualizarPerfil).toHaveBeenCalledWith({
      nome: 'Mariana Silva Alterada',
    });
    expect(component.editandoNome()).toBe(false);
    expect(notificationSpy.sucesso).toHaveBeenCalledWith('Nome de exibição atualizado com sucesso.');
  });

  it('deve cancelar a edição do nome e restaurar o estado original', () => {
    component.iniciarEdicaoNome();
    expect(component.editandoNome()).toBe(true);

    component.cancelarEdicaoNome();
    expect(component.editandoNome()).toBe(false);
  });

  it('não deve salvar quando o formulário de nome for inválido', () => {
    component.iniciarEdicaoNome();
    component.formNome.patchValue({ nome: 'M' }); // Menor que 2 caracteres
    component.salvarNome();

    expect(authServiceSpy.atualizarPerfil).not.toHaveBeenCalled();
    expect(component.formNome.invalid).toBe(true);
  });

  it('deve abrir o modal de confirmação de logout e invocar authService.logout ao confirmar', () => {
    expect(component.modalLogoutAberto()).toBe(false);

    component.abrirModalLogout();
    expect(component.modalLogoutAberto()).toBe(true);

    component.confirmarLogout();
    expect(component.modalLogoutAberto()).toBe(false);
    expect(authServiceSpy.logout).toHaveBeenCalledWith(true);
  });

  it('deve sincronizar todos os dados e emitir notificação de sucesso quando acionado pelo usuário', () => {
    component.sincronizarTudo(true);
    expect(notificationSpy.sucesso).toHaveBeenCalledWith(
      'Dados do perfil e escopo operacional sincronizados.'
    );
  });
});
