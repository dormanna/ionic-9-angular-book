import { Service, signal } from '@angular/core';
import { Network } from '@capacitor/network';

@Service()
export class NetworkService {
  readonly connected = signal(true);

  constructor() {
    Network.getStatus()
      .then((status) => this.connected.set(status.connected));
    Network.addListener('networkStatusChange', (status) =>
      this.connected.set(status.connected));
  }
}
