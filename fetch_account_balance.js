const { axios } = require("axios");

async function fetch_account_balance(PV_IP, accountNumber) {
    try {
        const response = await axios.get(`http://${PV_IP}/accounts/${accountNumber}/balance`)
        return response.data.balance
    } catch (error) {
        console.log(error)
        return null
    }
}

module.exports = fetch_account_balance