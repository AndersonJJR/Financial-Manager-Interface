import { Pipe, PipeTransform } from '@angular/core';
import { formatarDataIsoParaBr } from '../utils/parcelamento-calculator.util';

@Pipe({
  name: 'dateBr',
})
export class DateBrPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatarDataIsoParaBr(value);
  }
}
