function fcm(fcm, push_data) {
    fcm.send(push_data, function (err, response) {
        if (err) {
            console.error('Push메시지 발송에 실패했습니다.');
            console.error(err);
            return;
        }

        console.log('Push메시지가 발송되었습니다.');
        console.log(response);
    });
}

module.exports = {
    fcm,
}