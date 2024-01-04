const env = process.env.APP_ENV || 'dev';

const devConfig = {
  inviteLink: "http://localhost:3000/invite?inviteId=",
  resourcesLink: "http://localhost:3000/api/resources",
  invoice: {
    receiptType: '011',
    sellPoint: 7,
    concept: 1,
    cuit: 20289094149,
  },
  receipt: {
    receiptType: '015',
    sellPoint: 7,
    concept: 1,
    cuit: 20289094149,
  }
}

const prodConfig = {
  inviteLink: "https://crear-app-a94ef456bf1a.herokuapp.com/invite?inviteId=",
  resourcesLink: "https://crear-app-a94ef456bf1a.herokuapp.com/api/resources",
  invoice: {
    receiptType: '011',
    sellPoint: 7,
    concept: 1,
    cuit: 20289094149,
  },
  receipt: {
    receiptType: '015',
    sellPoint: 7,
    concept: 1,
    cuit: 20289094149,
  }
}

export const config = env === 'dev' ? devConfig : prodConfig;