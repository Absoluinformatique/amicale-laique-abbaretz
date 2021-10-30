import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {ICreateOrderRequest, IPayPalConfig, ITransactionItem} from '../../../projects/ngx-paypal-lib/src/public_api';
import {FormControl, Validators} from '@angular/forms';

declare var hljs: any;


interface Classe {
  value: string;
}

interface Eleve {
  nom: string;
  prenom: string;
  classe: Classe;
}

interface Sapin {
  id: number;
  value: string;
  viewValue: string;
  price: number;
  quantity: number;
}

interface Buche {
  id: number;
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
  public payPalConfig?: IPayPalConfig;

  public showSuccess: boolean = false;
  public showCancel: boolean = false;
  public showError: boolean = false;
  public showPayment: boolean = false;
  public readonly npmCode = `npm install ngx-paypal --save`;


  eleve: Eleve;
  selectedClasse: Classe;
  selectedBuche: Buche;
  selectedSapin: Sapin;
  cart: Cart;

  classes: Classe[] = [
    {value: 'Sélectionner'},
    {value: 'PS'},
    {value: 'MS'},
    {value: 'GS'},
    {value: 'CP'},
    {value: 'CE1'},
    {value: 'CE2'},
    {value: 'CM1'},
    {value: 'CM2'}
  ];

  sapins: Sapin[] = [
    {id: 10, value: 'Sans - 0€', viewValue: 'Sans - 0€', price: 0, quantity: 1 },
    {id: 11, value: '125/150cm diamètre 50', viewValue: '125/150cm diamètre 50 - 20€', price: 2000, quantity: 1 },
    {id: 12, value: '150/175cm diamètre 50', viewValue: '150/175cm diamètre 50 - 25€', price: 2500, quantity: 1 },
    {id: 13, value: '175/200cm diamètre 50', viewValue: '175/200cm diamètre 50 - 30€', price: 3000, quantity: 1 }
  ];
  buches: Buche[] = [
    {id: 20, value: 'Sans', viewValue: 'Sans - 0€', price: 0, quantity: 1 },
    {id: 22, value: 'Diamètre 50', viewValue: 'Diamètre 50 - 4,50€', price : 450, quantity: 1 }
  ];

  private changeDetectorRef: ChangeDetectorRef;

  constructor(private cdr: ChangeDetectorRef) {
    this.changeDetectorRef = cdr;
    this.eleve = {nom: '', prenom: '', classe: this.classes[0]};
    this.selectedSapin = this.sapins[0];
    this.selectedBuche = this.buches[0];
    this.cart = {
      sapins: [],
      buches: []
    };
    this.selectedClasse = this.classes[0];
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
    this.showPayment = false;

    if (selectedSapin === this.sapins[0]) {
      return;
    }
    let sapinAlreadyPresent = false;
    for (const sapin of this.cart.sapins) {
      if (selectedSapin === sapin) {
        sapin.quantity += 1;
        sapinAlreadyPresent = true;
      }
    }
    if (!sapinAlreadyPresent) {
      this.cart.sapins.push(selectedSapin);
    }
  }

  ajoutBuche(selectedBuche: Buche) {
    this.showPayment = false;

    if (selectedBuche === this.buches[0]) {
      return;
    }
    let bucheAlreadyPresent = false;
    for (const buche of this.cart.buches) {
      if (this.selectedBuche === buche) {
        buche.quantity += 1;
        bucheAlreadyPresent = true;
      }
    }
    if (!bucheAlreadyPresent) {
      this.cart.buches.push(selectedBuche);
    }
  }

  ngOnInit(): void {
    this.initConfig(this.sapins, this.buches, '0.00');
  }

  ngAfterViewInit(): void {
    this.prettify();
  }

  changePrice(): void {
    const price = this.getTotalPrice();
    if (price) {
      this.showPayment = true;
      this.initConfig(this.cart.sapins, this.cart.buches, price);
    }
  }

  private generateItems(sapins: Sapin[], buches: Buche[]) {

    const items: ITransactionItem[] = [];

    for (const sapin of sapins) {
      items.push({
        name: sapin.value,
        quantity: sapin.quantity.toString(),
        category: 'DIGITAL_GOODS',
        unit_amount: {
          currency_code: 'EUR',
          value: (sapin.price / 100).toFixed(2).valueOf()
        }
      });
    }

    for (const buche of buches) {
      items.push({
        name: buche.value,
        quantity: buche.quantity.toString(),
        category: 'DIGITAL_GOODS',
        unit_amount: {
          currency_code: 'EUR',
          value: (buche.price / 100).toFixed(2).toString()
        },
        description: buche.viewValue,
        sku: buche.id.toString()
      });
    }

    if (items.length === 0) {
      items.push({
          name: sapins[0].value,
          quantity: sapins[0].quantity.toString(),
          category: 'DIGITAL_GOODS',
          unit_amount: {
            currency_code: 'EUR',
            value: (sapins[0].price / 100).toFixed(2).toString()
          },
        description: sapins[0].viewValue,
        sku: '10'
      });
    }

    return items;
  }

  private initConfig(sapins: Sapin[], buches: Buche[], price: string): void {

    const items = this.generateItems(sapins, buches);

    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AVhfKvtREGc8tTS8ktHEqea3a3CbkVeP7Y4v_69EqyXL7y-KghJVIAaDypvUcoCMCDLH8SuawXxEAdIH',
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
            items: items
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
        this.changeDetectorRef.detectChanges();
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
        this.showCancel = true;
        this.changeDetectorRef.detectChanges();
      },
      onError: err => {
        console.log('OnError', err);
        this.showError = true;
        this.changeDetectorRef.detectChanges();
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
        this.resetStatus();
        this.changeDetectorRef.detectChanges();
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

  supprimerSapin(sapin: Sapin) {
    const selectedSapin = this.cart.sapins[this.cart.sapins.findIndex(item => item.id === sapin.id)];
    selectedSapin.quantity --;
    if (selectedSapin.quantity === 0) {
      this.cart.sapins.splice(this.cart.sapins.findIndex(item => item.id === sapin.id), 1);
    }
  }

  supprimerBuche(buche: Buche) {
    const selectedSapin = this.cart.buches[this.cart.buches.findIndex(item => item.id === buche.id)];
    selectedSapin.quantity --;
    if (selectedSapin.quantity === 0) {
      this.cart.buches.splice(this.cart.buches.findIndex(item => item.id === buche.id), 1);
    }
  }
}
