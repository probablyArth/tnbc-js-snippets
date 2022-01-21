const { axios } = require('axios')

async function fetchAccountBalance (PV_IP, accountNumber) {
  try {
    const response = await axios.get(`http://${PV_IP}/accounts/${accountNumber}/balance`)
    return response.data.balance
  } catch (error) {
    console.log(error)
    return null
  }
}

module.exports = fetchAccountBalance
