const nacl = require('tweetnacl')
const { axios } = require('axios')
const _ = require('lodash')

async function sendPayment (bankIP, signingKey, destinationAccountNumber, Amount, Memo) {
  if (!isValid(signingKey)) return { success: false, message: 'Invalid Signing key' }

  if (!isValid(destinationAccountNumber)) return { success: false, message: 'Invalid Account Number' }

  const keyPair = generateKeyPair(signingKey)
  const recipientData = await getRecipientData(bankIP)

  const txs = [
    {
      amount: Amount,
      memo: Memo,
      recipient: destinationAccountNumber
    },
    {
      amount: recipientData.validator.fee,
      fee: 'PRIMARY_VALIDATOR',
      recipient: recipientData.validator.account_number
    },
    {
      amount: recipientData.bank.fee,
      fee: 'BANK',
      recipient: recipientData.bank.account_number
    }
  ]

  const balanceLock = await getBalanceLock(recipientData.validator.ip, keyPair)

  const message = {
    balance_key: balanceLock,
    txs: _.orderBy(txs, ['recipient'])
  }

  const signature = generateSignature(message, keyPair)

  const block = generateBlock(message, signature, keyPair)

  return await postBlock(bankIP, block)
}

function generateBlock (message, signature, keyPair) {
  return {
    account_number: Buffer.from(keyPair.publicKey).toString('hex'),
    message,
    signature
  }
}

async function getRecipientData (bankIP) {
  const response = await axios.get(`http://${bankIP}/config`)
  return {
    bank: {
      account_number: response.data.account_number,
      fee: response.data.default_transaction_fee
    },
    validator: {
      account_number: response.data.primary_validator.account_number,
      fee: response.data.primary_validator.default_transaction_fee,
      ip: response.data.primary_validator.ip_address
    }
  }
}

async function postBlock (bankIP, block) {
  const response = await axios.post(`http://${bankIP}/blocks`, block)
  return { status: response.status, message: response.statusText }
}

function generateSignature (message, keyPair) {
  // Encode message to Uint8Array
  const encodedMessage = new TextEncoder().encode(JSON.stringify(message))

  return Buffer.from(nacl.sign(encodedMessage, keyPair.secretKey)).toString('hex').substring(0, 128)
}

function generateKeyPair (signingKey) {
  // Convert signingKey from string to Uint8Array
  const key = new Uint8Array(64)
  const encodedKey = new Uint8Array(Buffer.from(signingKey, 'hex'))
  key.set(encodedKey)
  const keyPair = nacl.sign.keyPair.fromSeed(encodedKey)

  return keyPair
}

async function getBalanceLock (bankIP, keyPair) {
  const accountNumberHex = Buffer.from(keyPair.publicKey).toString('hex')
  const response = await axios.get(`http://${bankIP}/accounts/${accountNumberHex}/balance_lock`)
  return response.data.balance_lock
}

function isValid (key) {
  if (!/^[A-F0-9]+$/i.test(key)) return false

  if (key.length !== 64) return false

  return true
}

module.exports = sendPayment
