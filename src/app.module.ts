import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyRMQModule } from './proxyrmq/proxyrmq.module';
import { DesafiosModule } from './desafios/desafios.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://localhost:27017/smartranking?directConnection=true',
      {
        useUnifiedTopology: true,
      },
    ),
    ConfigModule.forRoot({ isGlobal: true }),
    ProxyRMQModule,
    DesafiosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
