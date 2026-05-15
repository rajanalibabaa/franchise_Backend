// utils/gstCalculator.js

/**
 * GST Calculation for Indian Businesses
 * CGST + SGST (Intra-state) or IGST (Inter-state)
 */
export class GSTCalculator {
  static GST_RATE = 18; // 18% GST (configurable)
  static CGST_RATE = 9;  // 9%
  static SGST_RATE = 9;  // 9%
  static IGST_RATE = 18; // 18%

  /**
   * Calculate GST breakdown
   * @param {number} baseAmount - Amount before tax
   * @param {string} fromState - Seller state code
   * @param {string} toState - Buyer state code
   * @returns {object} Tax breakdown
   */
  static calculate(baseAmount, fromState = 'MH', toState = 'MH') {
    const isInterState = fromState !== toState;

    let cgst = 0, sgst = 0, igst = 0;

    if (isInterState) {
      igst = (baseAmount * this.IGST_RATE) / 100;
    } else {
      cgst = (baseAmount * this.CGST_RATE) / 100;
      sgst = (baseAmount * this.SGST_RATE) / 100;
    }

    const totalGST = cgst + sgst + igst;
    const finalAmount = baseAmount + totalGST;

    return {
      baseAmount: parseFloat(baseAmount.toFixed(2)),
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      igst: parseFloat(igst.toFixed(2)),
      totalGST: parseFloat(totalGST.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
      isInterState,
      gstRate: this.GST_RATE,
    };
  }

  /**
   * Reverse calculate base amount from final amount
   */
  static reverseCalculate(finalAmount) {
    const baseAmount = (finalAmount * 100) / (100 + this.GST_RATE);
    const gst = finalAmount - baseAmount;

    return {
      baseAmount: parseFloat(baseAmount.toFixed(2)),
      gst: parseFloat(gst.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
    };
  }
}