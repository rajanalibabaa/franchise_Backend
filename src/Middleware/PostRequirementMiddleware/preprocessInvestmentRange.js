export const preprocessInvestmentRange = (req, res, next) => {
    const { investmentRange } = req.body;
  
    if (typeof investmentRange === 'string' && investmentRange.includes('-')) {
      const [min, max] = investmentRange.split('-').map(Number);
      req.body.investmentRange = { min, max };
    }
  
    next();
  };
  