

request.get(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
        var data = JSON.parse(body)
        console.log(data.friends.data)
        req.body.id = data.id
        req.body.name = data.name
    } else {
        res.status(500).json({
            message: "Internal server error",
            data: null
        })
    }
});