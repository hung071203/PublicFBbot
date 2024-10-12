const baseUrl = "https://www.hungdev.id.vn/"
const key = process.env.APIHUNGDEV
const axios = require('axios')
async function xoanen(url) {
    try {
        const response = await axios.get(`${baseUrl}ai/xoanen?url=${url}&apikey=${key}`)
        return response.data
    } catch (error) {
        throw error
    }
}

async function getLink(url) {
    try {
        const response = await axios.get(`${baseUrl}media/downAIO?url=${url}&apikey=${key}`)
        return response.data
    } catch (error) {
        throw error
    }
}

module.exports = { xoanen, getLink }