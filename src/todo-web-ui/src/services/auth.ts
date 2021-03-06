import { BehaviorSubject, noop } from 'rxjs';
import { IUser } from '../models';
import { HttpService } from './http';

const IDENTITY_URL = 'identity';
const NEW_URL = 'new';

interface Credentials {
  username: string;
  password: string;
}

class AuthServiceImpl {
  private _user = new BehaviorSubject<IUser | null>(null);
  public user = this._user.asObservable();

  initialCheck = this.check().catch(noop);

  async check(): Promise<IUser> {
    const response = await HttpService.get(IDENTITY_URL);

    if (response.ok) {
      const user: IUser = await response.json();
      this._user.next(user);
      return user;
    }

    this._user.next(null);
    return Promise.reject();
  }

  async login(credentials: Credentials): Promise<IUser> {
    const response = await HttpService.post(IDENTITY_URL, {
      json: credentials,
    });

    if (response.ok) {
      const user: IUser = await response.json();
      this._user.next(user);
      return user;
    }

    this._user.next(null);
    return Promise.reject();
  }

  async logout(): Promise<void> {
    const response = await HttpService.delete(IDENTITY_URL);

    if (response.ok) {
      this._user.next(null);
      return;
    }

    return Promise.reject();
  }

  async new(user: Credentials): Promise<IUser> {
    const response = await HttpService.post([IDENTITY_URL, NEW_URL], {
      json: user,
    });

    if (response.ok) {
      const user: IUser = await response.json();
      this._user.next(user);
      return user;
    }

    this._user.next(null);
    return Promise.reject();
  }
}

export const AuthService = new AuthServiceImpl();
