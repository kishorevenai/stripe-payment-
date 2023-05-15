require('dotenv').config()
const express = require('express')
const app = express();
const PORT = process.env.PORT || 3000
const path = require('path')


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'/public')))

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

const items = new Map([
    [1,{priceIncents: 10000 , name:"Learn React Today"}],
    [2,{priceIncents: 20000 , name:"Learn CSS Today"}]
])


app.post('/create-checkout-session', async(req,res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types : ['card'],
            mode:'payment',
            line_items:req.body.items.map(item => {
                const storeItem = items.get(item.id)
                return  {
                    price_data : {
                        currency : 'INR',
                        product_data : {
                            name:  storeItem.name
                        },
                        unit_amount : storeItem.priceIncents
                    },
                    quantity : item.quantity
                }
            }),
            success_url: `${process.env.SERVER_URL}/success.html`,
            cancel_url:`${process.env.SERVER_URL}/cancel.html`
        })
        res.json({url : session.url})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
    
})

app.listen(PORT , () => {
    console.log(`Running on port ${PORT}`)
})