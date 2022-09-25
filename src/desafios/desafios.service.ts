import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import * as momentTimezone from 'moment-timezone';

import { Model } from 'mongoose';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';
import { DesafioStatus } from './desafio-status.enum';
import { Desafio } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private clientNotificacoes =
    this.clientProxySmartRanking.getClientProxyNotificacoesInstance();

  async criarDesafio(desafio: Desafio): Promise<Desafio> {
    try {
      const desafioCriado = new this.desafioModel(desafio);
      desafioCriado.dataHoraSolicitacao = new Date();
      desafioCriado.status = DesafioStatus.PENDENTE;
      console.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`);
      await desafioCriado.save();

      return this.clientNotificacoes
        .emit('notificacao-novo-desafio', desafio)
        .toPromise();
    } catch (error) {
      console.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarTodosDesafios(): Promise<Desafio[]> {
    try {
      return await this.desafioModel.find().exec();
    } catch (error) {
      console.log(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarDesafiosRealizados(idCategoria: string): Promise<Desafio[]> {
    try {
      return await this.desafioModel
        .find()
        .where('categoria')
        .equals(idCategoria)
        .where('status')
        .equals(DesafioStatus.REALIZADO)
        .exec();
    } catch (e) {
      throw new RpcException(e.message);
    }
  }

  async consultarDesafiosRealizadosPelaData(
    idCategoria: string,
    dataRef: string,
  ): Promise<Desafio[]> {
    try {
      const dataRefNew = `${dataRef} 23:59:59.999`;

      const finalData = await this.desafioModel
        .find()
        .where('categoria')
        .equals(idCategoria)
        .where('status')
        .equals(DesafioStatus.REALIZADO)
        .where('dataHoraDesafio', {
          $lte: momentTimezone(dataRefNew)
            .tz('UTC')
            .format('YYYY-MM-DD HH:mm:ss.SSS+00:00'),
        })
        .exec();

      return finalData;
    } catch (e) {
      throw new RpcException(e.message);
    }
  }

  async consultarDesafiosDeUmJogador(_id): Promise<Desafio[] | Desafio> {
    try {
      return await this.desafioModel.find().where('jogadores').in(_id).exec();
    } catch (error) {
      console.log(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async consultarDesafioPeloId(_id: string): Promise<Desafio> {
    try {
      return await this.desafioModel.findOne({ _id }).exec();
    } catch (error) {
      console.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async atualizarDesafio(_id: string, desafio: Desafio): Promise<void> {
    try {
      desafio.dataHoraResposta = new Date();
      await this.desafioModel
        .findOneAndUpdate({ _id }, { $set: desafio })
        .exec();
    } catch (error) {
      console.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async atualizarDesafioPartida(
    idPartida: string,
    desafio: Desafio,
  ): Promise<void> {
    try {
      desafio.status = DesafioStatus.REALIZADO;
      desafio.partida = idPartida;
      await this.desafioModel
        .findOneAndUpdate({ _id: desafio._id }, { $set: desafio })
        .exec();
    } catch (error) {
      console.log(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async deletarDesafio(desafio: Desafio): Promise<void> {
    try {
      const { _id } = desafio;
      desafio.status = DesafioStatus.CANCELADO;
      console.log(`desafio: ${JSON.stringify(desafio)}`);
      await this.desafioModel
        .findOneAndUpdate({ _id }, { $set: desafio })
        .exec();
    } catch (error) {
      console.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
