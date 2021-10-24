// code used for the basic api usage picture
// process if we need to update this:
// create 3 code snippets as pictures using carbon.now.sh
// here's the exact configuration used: https://carbon.now.sh/?bg=rgba%2882%2C161%2C209%2C1%29&t=seti&wt=none&l=application%2Ftypescript&ds=false&dsyoff=20px&dsblur=68px&wc=false&wa=true&pv=56px&ph=56px&ln=false&fl=1&fm=Hack&fs=14px&lh=152%25&si=false&es=2x&wm=false&code=code%2520goes%2520here
// open up `ngx-sub-form-mini-presentation.psd` here: https://www.photopea.com
// replace the pictures
// export the new psd file and the new png to the repo
@Component({
  selector: 'person-container',
  template: `
    <person-form [person]="person$ | async" (personUpdate)="personUpdate($event)"></person-form>
  `,
})
export class PersonContainer {
  public person$: Observable<Person> = this.personService.person$;

  constructor(private personService: PersonService) {}

  public personUpdate(person: Person): void {
    this.personService.update(person);
  }
}

// note on this one, remove the `prettier-ignore` comment once
// the code is on carbon.now.sh, this is just to keep a good
// ratio for the image in the readme
@Component({
  selector: 'person-form',
  // prettier-ignore
  template: `
    <form [formGroup]="form.formGroup">
      <input type="text" [formControlName]="form.formControlNames.firstName" />
      <input type="text" [formControlName]="form.formControlNames.lastName" />
      <address-control
        [formControlName]="form.formControlNames.address"
      ></address-control>
    </form>
  `
})
export class PersonForm {
  private input$: Subject<Person | undefined> = new Subject();
  @Input() set person(person: Person | undefined) {
    this.input$.next(person);
  }

  private disabled$: Subject<boolean> = new Subject();
  @Input() set disabled(value: boolean | undefined) {
    this.disabled$.next(!!value);
  }

  @Output() personUpdate: Subject<Person> = new Subject();

  public form = createForm<Person>(this, {
    formType: FormType.ROOT,
    disabled$: this.disabled$,
    input$: this.input$,
    output$: this.personUpdate,
    formControls: {
      id: new FormControl(null, Validators.required),
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
    },
  });
}

@Component({
  selector: 'address-control',
  template: `
    <div [formGroup]="form.formGroup">
      <input type="text" [formControlName]="form.formControlNames.street" />
      <input type="text" [formControlName]="form.formControlNames.city" />
      <input type="text" [formControlName]="form.formControlNames.state" />
      <input type="number" [formControlName]="form.formControlNames.zipCode" />
    </div>
  `,
  providers: subformComponentProviders(PersonForm),
})
export class PersonForm {
  public form = createForm<Address>(this, {
    formType: FormType.SUB,
    formControls: {
      street: new FormControl(null, Validators.required),
      city: new FormControl(null, Validators.required),
      state: new FormControl(null, Validators.required),
      zipCode: new FormControl(null, Validators.required),
    },
  });
}
