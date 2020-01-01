
function getMoneyLimit200(A) {
    return 4/4 * A/3;
}
function getMoneyLimit175(A) {
    return 4/3 * A/3 + getMoneyLimit200(A);
}
function getMoneyLimit150(A) {
    return 4/2 * A/3 + getMoneyLimit175(A);
}
function isAtLimit(moneyLimit,fundingMoneySum) {
    return (moneyLimit - fundingMoneySum) < 5000;
} 
function getFundingBenefits(marginPercent,goalMoney,regularMoney) {
    return (marginPercent*goalMoney - marginPercent*regularMoney); 
} 
function getRefundPerOfPer(moneyLimit,fundingMoneySum) {
    return (100 - (fundingMoneySum / moneyLimit * 100));
}
function getCurGoalPer(currentSales, goalMoney){
    return (currentSales/ goalMoney * 100);
}
function getRewardMoney(fundingMoney, rewardPercent) {
    return (fundingMoney * rewardPercent / 100);
}
function getProfit(fundingMoney, rewardPercent) {
    return (getRewardMoney(fundingMoney, rewardPercent) - fundingMoney);
}
module.exports = {
    getMoneyLimit200,
    getMoneyLimit175,
    getMoneyLimit150,
    isAtLimit,
    getFundingBenefits,
    getRefundPerOfPer,
    getCurGoalPer,
    getRewardMoney,
    getProfit,
}