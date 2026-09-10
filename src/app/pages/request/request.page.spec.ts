import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { NavController, ToastController }
        from '@ionic/angular';

import { RequestPage } from './request.page';
import { TourService } from '../../services/tour.service';
import { RequestService }
        from '../../services/request.service';
import { NetworkService }
        from '../../services/network.service';
import { Tour } from '../../models/tour';

const tour: Tour = {
  id: '1',
  title: 'Round Trip Bonn',
  summary: 'The main sights of the city center.',
  imageUrl: '/api/img/large/city.jpg',
  thumbnailUrl: '/api/img/small/city.jpg',
  duration: 3,
  maxPersons: 25,
  price: 90,
  priceForeign: 110,
  startingPoint: {
    lat: 50.732,
    lng: 7.096,
    location: 'Hauptbahnhof, Bonn',
  },
};

describe('RequestPage', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: TourService,
          useValue: { byId: () => tour },
        },
        {
          provide: RequestService,
          useValue: { send: async () => ({ ID: 1 }) },
        },
        {
          provide: ToastController,
          useValue: {
            create: async () => ({
              present: async () => undefined,
            }),
          },
        },
        {
          provide: NavController,
          useValue: { navigateBack: async () => undefined },
        },
      ],
    }));

  const page = async () => {
    const fixture = TestBed.createComponent(RequestPage);
    fixture.componentRef.setInput('id', '1');
    await fixture.whenStable();
    return fixture.componentInstance;
  };

  it('starts out invalid, and says where', async () => {
    const request = await page();

    expect(request.requestForm().invalid()).toBe(true);
    expect(request.requestForm.email().invalid())
      .toBe(true);
  });

  it('turns valid when the three fields are filled',
     async () => {
    const request = await page();
    const form = request.requestForm;

    form.firstName().value.set('Anna');
    form.lastName().value.set('Meyer');
    form.email().value.set('anna@example.com');

    expect(form().valid()).toBe(true);
  });

  it('takes the value from an ionInput event',
     async () => {
    const fixture = TestBed.createComponent(RequestPage);
    fixture.componentRef.setInput('id', '1');
    await fixture.whenStable();
    const request = fixture.componentInstance;

    const email: HTMLIonInputElement =
      fixture.nativeElement
        .querySelector('ion-input[type="email"]');

    email.value = 'anna@example.com';
    email.dispatchEvent(new CustomEvent('ionInput'));

    expect(request.request().email)
      .toBe('anna@example.com');
  });

  it('sends nothing when the form is empty', async () => {
    const send = vi.fn(async () => ({ ID: 42 }));
    TestBed.overrideProvider(RequestService, {
      useValue: { send },
    });
    TestBed.overrideProvider(NetworkService, {
      useValue: { connected: () => true },
    });

    const request = await page();
    await request.send();

    expect(send).not.toHaveBeenCalled();
  });

  it('sends once, without a pick-up the bus will not '
     + 'make', async () => {
    const send = vi.fn(async () => ({ ID: 42 }));
    TestBed.overrideProvider(RequestService, {
      useValue: { send },
    });
    TestBed.overrideProvider(NetworkService, {
      useValue: { connected: () => true },
    });

    const request = await page();
    const form = request.requestForm;
    form.firstName().value.set('Anna');
    form.lastName().value.set('Meyer');
    form.email().value.set('anna@example.com');
    form.pickUp().value.set('Hotel Sternchen');
    await request.send();

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'anna@example.com',
        bus: false,
        pickUp: '',
      }),
    );
  });

  it('sends nothing while there is no connection',
     async () => {
    const send = vi.fn(async () => ({ ID: 42 }));
    TestBed.overrideProvider(RequestService, {
      useValue: { send },
    });
    TestBed.overrideProvider(NetworkService, {
      useValue: { connected: () => false },
    });

    const request = await page();
    const form = request.requestForm;
    form.firstName().value.set('Anna');
    form.lastName().value.set('Meyer');
    form.email().value.set('anna@example.com');
    await request.send();

    expect(send).not.toHaveBeenCalled();
  });
});
