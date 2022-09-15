import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DesafioStatus } from './desafio-status.enum';
import { Desafio } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
  ) {}

  async criarDesafio(desafio: Desafio): Promise<Desafio> {
    try {
      const desafioCriado = new this.desafioModel(desafio);
      desafioCriado.dataHoraSolicitacao = new Date();
      /*
            Quando um desafio for criado, definimos o status 
            desafio como pendente
        */
      desafioCriado.status = DesafioStatus.PENDENTE;
      console.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`);
      return await desafioCriado.save();
    } catch (error) {
      console.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
