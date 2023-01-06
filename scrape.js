const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')

const PORT = process.env.PORT || 5174

const app = express()

//Get the prices of cryptocurrencis

const getCurrentPrices = async (lsize) => {

    try {
        const coinsListed = lsize;

        let coinname
        let coinid
        let coinprice

        const coinsArray = []

        const siteUrl = 'https://www.coingecko.com/'
        const { data } = await axios({
            method: "GET",
            url: siteUrl
        })

        const $ = cheerio.load(data)
        const elementSelector = 'body > div.container > div.gecko-table-container > div.coingecko-table > div.position-relative > div > table > tbody > tr'
        
        $(elementSelector).each((index, childElement) => {
            if(index < coinsListed){
                $(childElement).children().each((i, e) => {
                        if(i === 1) {
                            let coinIndex = $(e).text().replace(/[^A-Za-z0-9,.$]/g, '')
                            coinid = coinIndex
                        }
                        if(i === 2) {
                            let coinName = $(e).text().split('\n', 9)[8]
                            coinname = coinName
                        }
                        if(i === 3) {
                            let coinPrice = $(e).text().replace(/[^A-Za-z0-9.]/g, '')
                            coinprice = coinPrice
                        }
                })
                coinsArray.push({
                    "coinId": coinid,
                    "coinName": coinname,
                    "coinPrice": '$' + coinprice
                })
            }
        })
        return coinsArray
    } catch (err) {
        console.log(err)
    }
}

//Home page

app.get('/', (req, res) => {
    res.status(200).send('<h1>Welcome to the ctypto api home page</h1>')
})

//Curren prices of top 100 cryptos

app.get('/current-prices', async(req, res) => {
    try {
        const coinsData = await getCurrentPrices(100)
        return res.status(200).json({"data": coinsData})
    } catch (err) {
        return res.status(404).json({"err": err.toString()})
    }
})

//Current prices of the first X amount of cryptos

app.get('/current-prices/:listSize',async(req ,res) => {
    try {
        const { listSize } = req.params
        const coinsData = await getCurrentPrices(listSize)

        return res.status(200).json({"data": coinsData})
    } catch (err) {
        return res.status(404).json({"err": err.toString()})
    }
})

//Current price of a certain crypto

app.get('/current-price/:cryptoName', async(req, res) => {
    try {
        const { cryptoName } = req.params
        const coinsData = await getCurrentPrices(100)
        let tempObj = {}

        for(let i = 0; i < 100; i++){
            if(coinsData[i].coinName === cryptoName || coinsData[i].coinName.toLowerCase() === cryptoName){
                tempObj = coinsData[i]
            }
        }
        return res.status(200).json({"data": tempObj})
    } catch (err) {
        return res.status(404).json({"err": err.toString()})
    }
})



app.listen(PORT, () => {
    console.log(`Server runnning on port: ${PORT}`);
})