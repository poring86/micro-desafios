import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Desafio } from 'src/desafios/interfaces/desafio.interface';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { Partida } from './interfaces/partida.interface';

@Injectable()
export class PartidasService {
  constructor(
    @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private clientDesafios =
    this.clientProxySmartRanking.getClientProxyDesafiosInstance();

  async criarPartida(partida: Partida): Promise<Partida> {
    try {
      const partidaCriada = new this.partidaModel(partida);
      console.log(`partidaCriada: ${JSON.stringify(partidaCriada)}`);
      const result = await partidaCriada.save();
      console.log(`result: ${JSON.stringify(result)}`);
      const idPartida = result._id;
      const desafio: Desafio = await this.clientDesafios
        .send('consultar-desafios', { idJogador: '', _id: partida.desafio })
        .toPromise();

      return await this.clientDesafios
        .emit('atualizar-desafio-partida', {
          idPartida: idPartida,
          desafio: desafio,
        })
        .toPromise();
    } catch (error) {
      console.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
