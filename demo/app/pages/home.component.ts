import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { ICreateOrderRequest, IPayPalConfig } from '../../../projects/ngx-paypal-lib/src/public_api';
import {FormControl, Validators} from '@angular/forms';

declare var hljs: any;


interface Classe {
  value: string
}

interface Eleve {
  nom: string
  prenom: string
  classe: Classe
}

interface Sapin {
  value: string;
  viewValue: string;
  price: number;
  quantity: number;
}

interface Buche {
  value: string;
  viewValue: string;
  price: number;
  quantity: number;
}

interface Cart {
  sapins: Sapin[];
  buches: Buche[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnInit {
  public defaultPrice: string = '9.99';
  public payPalConfig?: IPayPalConfig;

  public showSuccess: boolean = false;
  public showCancel: boolean = false;
  public showError: boolean = false;
  public readonly npmCode = `npm install ngx-paypal --save`;


  email = new FormControl('', [Validators.required, Validators.email]);
  eleve: Eleve;
  selectedClasse: Classe;
  selectedBuche: Buche;
  selectedSapin: Sapin;
  cart: Cart;

  classes: Classe[] = [
    {value: 'PS'},
    {value: 'MS'},
    {value: 'GS'},
    {value: 'CP'},
    {value: 'CE1'},
    {value: 'CE2'},
    {value: 'CM1'},
    {value: 'CM2'}
  ]

  sapins: Sapin[] = [
    {value: 'Sans - 0€', viewValue: 'Sans - 0€', price: 0, quantity: 1 },
    {value: '125/150cm diamètre 50', viewValue: '125/150cm diamètre 50 - 20€', price: 2000, quantity: 1 },
    {value: '150/175cm diamètre 50', viewValue: '150/175cm diamètre 50 - 25€', price: 2500, quantity: 1 },
    {value: '175/200cm diamètre 50', viewValue: '175/200cm diamètre 50 - 30€', price: 3000, quantity: 1 }
  ];
  buches: Buche[] = [
    {value: 'Sans', viewValue: 'Sans - 0€', price: 0, quantity: 1 },
    {value: 'Diamètre 50', viewValue: 'Diamètre 50 - 4,50€', price : 450, quantity: 1 }
  ];

  constructor() {
    this.eleve = {nom: '', prenom: '', classe: this.classes[0]}
    this.selectedSapin = this.sapins[0]
    this.selectedBuche = this.buches[0]
    this.cart = {
      sapins: [],
      buches: []
    }
    this.selectedClasse = this.classes[0]
  }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'Vous devez saisir une adresse mail';
    }

    return this.email.hasError('email') ? 'Merci de saisir une adresse mail valide' : '';
  }

  getTotalPrice() {
    let total = 0;
    for (const sapin of this.cart.sapins) {
      total += sapin.price * sapin.quantity;
    }
    for (const buche of this.cart.buches) {
      total += buche.price * buche.quantity;
    }
    if (total > 0) {
      total = total / 100;
    }
    return total.toFixed(2);
  }

  ajoutSapin(selectedSapin: Sapin) {
    if (selectedSapin === this.sapins[0]) {
      return;
    }
    let sapinAlreadyPresent = false;
    for (const sapin of this.cart.sapins) {
      if(selectedSapin === sapin) {
        sapin.quantity += 1
        sapinAlreadyPresent = true;
      }
    }
    if (!sapinAlreadyPresent) {
      this.cart.sapins.push(selectedSapin);
    }
  }

  ajoutBuche(selectedBuche: Buche) {
    if (selectedBuche === this.buches[0]) {
      return;
    }
    let bucheAlreadyPresent = false;
    for (const buche of this.cart.buches) {
      if (this.selectedBuche === buche) {
        buche.quantity += 1
        bucheAlreadyPresent = true
      }
    }
    if (!bucheAlreadyPresent) {
      this.cart.buches.push(selectedBuche);
    }
  }

  public readonly moduleInstallation = `
  import { NgxPayPalModule } from 'ngx-paypal';

  @NgModule({
    imports: [
      NgxPayPalModule,
      ...
    ],
  })
  `;

  public readonly initPaypalCode = `this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AbD6q330sVV8dEIs1u9Uwy0qUK10YNwEIfeaiqu0TRc0EbJ2RQIp2v29phESxbp05YkyLbaYpW2ZYYvk',
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'EUR',
              value: get,
              breakdown: {
                item_total: {
                  currency_code: 'EUR',
                  value: '9.99'
                }
              }
            },
            items: [
              {
                name: 'Enterprise Subscription',
                quantity: '1',
                category: 'DIGITAL_GOODS',
                unit_amount: {
                  currency_code: 'EUR',
                  value: '9.99',
                },
              }
            ]
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then(details => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);
        });
      },
      onClientAuthorization: (data) => {
        console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
        this.showSuccess = true;
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        console.log('OnError', err);
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      },
    };`;

  public readonly htmlCode = `<ngx-paypal [config]="payPalConfig"></ngx-paypal>`;

  public readonly usageCodeTs = `
  import { Component, OnInit } from '@angular/core';
  import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';

  @Component({
    templateUrl: './your.component.html',
  })
  export class YourComponent implements OnInit {

    public payPalConfig?: IPayPalConfig;

    ngOnInit(): void {
      this.initConfig();
    }

    private initConfig(): void {
      ${this.initPaypalCode}
    }
  }
  `;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.prettify();
  }

  changePrice(): void {
    const price = this.getTotalPrice();
    if (price) {
      this.initConfig(price);
    }
  }

  private initConfig(price: string): void {
    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'sb',
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'EUR',
              value: price,
              breakdown: {
                item_total: {
                  currency_code: 'EUR',
                  value: price
                }
              }
            },
            items: [
              {
                name: 'Enterprise Subscription',
                quantity: '1',
                category: 'DIGITAL_GOODS',
                unit_amount: {
                  currency_code: 'EUR',
                  value: price,
                },
              }
            ]
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then((details: any) => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);
        });

      },
      onClientAuthorization: (data) => {
        console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
        this.showSuccess = true;
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
        this.showCancel = true;

      },
      onError: err => {
        console.log('OnError', err);
        this.showError = true;
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
        this.resetStatus();
      },
      onInit: (data, actions) => {
        console.log('onInit', data, actions);
      }
    };
  }

  private resetStatus(): void {
    this.showError = false;
    this.showSuccess = false;
    this.showCancel = false;
  }

  private prettify(): void {
    hljs.initHighlightingOnLoad();
  }
}
