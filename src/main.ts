import { Envs } from './common/envs/env';
import { App } from './index';

const app = new App(Envs.main.appPort, Envs.main.host);
app.run();
