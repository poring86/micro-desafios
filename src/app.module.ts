import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProxyRMQModule } from './proxyrmq/proxyrmq.module';
import { DesafiosModule } from './desafios/desafios.module';
import { PartidasModule } from './partidas/partidas.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://localhost:27017/srdesafios?directConnection=true',
      {
        useUnifiedTopology: true,
      },
    ),
    ConfigModule.forRoot({ isGlobal: true }),
    ProxyRMQModule,
    DesafiosModule,
    PartidasModule,
  ],
})
export class AppModule {}
