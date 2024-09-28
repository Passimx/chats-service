import { Envs } from './common/envs/env';
import { App } from './index';

const app = new App(1234, Envs.main.host);
app.run();
