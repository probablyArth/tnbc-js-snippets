const { axios } = require('axios')

async function fetchIncomingTransactions (bankIP, accountNumber) {
  const response = await axios.get(`http://${bankIP}/bank_transactions?recipient=${accountNumber}`)

  if (response.status === 200) {
    return response.data
  }

  return 'There was an error with request at function fetchIncomingTransactions'
}

module.exports = fetchIncomingTransactions
