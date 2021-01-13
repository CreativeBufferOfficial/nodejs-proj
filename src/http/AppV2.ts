import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

export class AppV2 {
  private router: express.Router;
  private app: express.Application;
  constructor ({ router } : { router: express.Router }) {
    this.router = router;
    const app = express();

    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.set('trust proxy', true);
    app.disable('x-powered-by');
    app.use(router);

    this.app = app;
  }

  getApp(): express.Application {
    return this.app;
  }

  getRouter(): express.Router {
    return this.router;
  }
}