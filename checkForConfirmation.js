const { axios } = require('axios')

async function checkForConfirmation (bankIP, blockSignature) {
  const response = await axios.get(`http://${bankIP}/confirmation_blocks?block=&block_signature=${blockSignature}`)

  if (response.status === 200) {
    if (response.data.count > 0) {
      return true
    }
  }

  return false
}

module.exports = checkForConfirmation
