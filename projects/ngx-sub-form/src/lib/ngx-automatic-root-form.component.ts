import { NgxRootFormComponent } from "./ngx-root-form.component";

export abstract class NgxAutomaticRootFormComponent<
  ControlInterface,
  FormInterface = ControlInterface
> extends NgxRootFormComponent<ControlInterface, FormInterface> {}
