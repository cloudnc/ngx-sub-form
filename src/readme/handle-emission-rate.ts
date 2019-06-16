import { NGX_SUB_FORM_HANDLE_VALUE_CHANGES_RATE_STRATEGIES } from 'ngx-sub-form';
import { Observable } from 'rxjs';
import { ListingComponent, OneListingForm } from './listing.component';

class HandleEmissionRateExample extends ListingComponent {
  protected handleEmissionRate(): (obs$: Observable<OneListingForm>) => Observable<OneListingForm> {
    // debounce by 500ms
    return NGX_SUB_FORM_HANDLE_VALUE_CHANGES_RATE_STRATEGIES.debounce(500);
  }
}
