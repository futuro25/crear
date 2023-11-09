"use strict"

const logger     = require('../utils/logger');
const uploadImage = require('../utils/utils');
const self       = {};
const Log   = require('../models/log.model');
var moment = require('moment');
var facturajs = require('facturajs');
var AfipServices = facturajs.AfipServices;


self.upload = async (req, res) => {  
  if (req.files?.file.tempFilePath) {
    const assetUrl = await uploadImage(req.files.file.tempFilePath)
    return res.json(assetUrl);
  } else {
    return false;
  }
}

self.createReceipt = async (req, res) => {  
  
  // 015 RECIBO C
  // 011 FACTURA C
  // 6 FACTURA B

  const receiptType = req.body.receiptType || '011';
  const sellPoint = req.body.sellPoint || 7;
  const concept = req.body.concept || 1;
  const cuit = req.body.cuit || 20289094149;
  const amount = req.body.amount;

  const ImpIVA = 0;
  const ImpTotal = amount;
  const ImpNeto = amount;
  const ImpOpEx = 0;
  const ImpTotConc = 0;


  try {
    const config = {
      certPath: './keys/x509v2.pem',
      privateKeyPath: './keys/privada.key',
      cacheTokensPath: './.lastTokens',
      homo: true,
      tokensExpireInHours: 12,
    };

    const afip = new AfipServices(config);

    const data = await afip.getLastBillNumber({
      Auth: { Cuit: cuit },
      params: {
          CbteTipo: receiptType,
          PtoVta: sellPoint,
      },
    });
    console.log('Last bill number: ', JSON.stringify(data));

    const num = data.CbteNro;
    const nextBillNumber = num + 1;

    const resBill = await afip.createBill({
      Auth: { 
        Cuit: cuit 
      },
      params: {
        FeCAEReq: {
          FeCabReq: {
            CantReg: 1,
            PtoVta: sellPoint,
            CbteTipo: receiptType,
          },
          FeDetReq: {
            FECAEDetRequest: {
              DocTipo: 99,
              DocNro: 0,
              Concepto: concept,
              CbteDesde: nextBillNumber,
              CbteHasta: nextBillNumber,
              CbteFch: moment().format('YYYYMMDD'),
              ImpTotal: ImpTotal,
              ImpTotConc: ImpTotConc,
              ImpNeto: ImpNeto,
              ImpOpEx: ImpOpEx,
              ImpIVA: ImpIVA,
              ImpTrib: 0,
              MonId: 'PES',
              MonCotiz: 1,
            },
          },
        },
      },
    });

    
    await self.createLog('Receipt created', JSON.stringify(resBill));

    console.log('Created bill', JSON.stringify(resBill, null, 4));
    res.json(resBill)
  } catch (e) {
    console.error('Something was wrong!');
    console.error(e);
    res.json(e)
  }
}

self.getLogs = async (req, res) => {  
  try {
    const logs = await Log.find({deletedAt: null});
    logger.info('get logs', JSON.stringify(logs))
    res.json(logs);
  } catch (e) {
    logger.error('get logs', e.message)
    res.json({error: e.message})
  }
};

self.createLog = async (action, data) => {  
  try {
    const log = {
      'action': action,
      'data': data
    }
    const newLog = await Log.create(log);
    logger.info('create log', JSON.stringify(log))
    return newLog;
  } catch (e) {
    logger.error('create log', e.message)
    return {error: e.message}
  }
};

module.exports = self;