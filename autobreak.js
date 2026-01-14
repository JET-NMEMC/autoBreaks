/**
 * 根据最大值、最小值、拟形成数量，生成美观的等差序列
 * 
 * @param {number} minVal - 数据最小值
 * @param {number} maxVal - 数据最大值
 * @param {number} targetN - 期望的分段数量
 * @returns {Object} 包含序列信息的对象
 */
function autobreak(minVal, maxVal, targetN) {
    // 1. 输入预处理与安全检查
    let tMin = parseFloat(minVal);
    let tMax = parseFloat(maxVal);
    if (isNaN(tMin) || isNaN(tMax)) return null;
    
    // 确保顺序正确且范围有效
    if (tMin > tMax) [tMin, tMax] = [tMax, tMin];
    if (tMin === tMax) tMax = tMin + 1;

    const delta = tMax - tMin;
    const rawStep = delta / targetN;

    // 2. 智能确定美观步长 (Step Selection)
    // 获取量级 (例如 0.03 -> 10^-2)
    const magnitude = Math.floor(Math.log10(rawStep));
    const powerOf10 = Math.pow(10, magnitude);
    
    // 定义“美观”步长的候选系数 (1, 2, 3, 5, 10)
    const niceFactors = [1, 2, 3, 5, 10];
    let DX = niceFactors[0] * powerOf10;
    let minDiff = Infinity;

    // 寻找最接近目标分段数的步长系数
    for (const factor of niceFactors) {
        const currentDX = factor * powerOf10;
        const currentN = delta / currentDX;
        const diff = Math.abs(currentN - targetN);
        if (diff < minDiff) {
            minDiff = diff;
            DX = currentDX;
        }
    }

    // 3. 确定显示精度 (Precision Management)
    const getPrecision = (x) => {
        for (let i = 0; i < 12; i++) {
            if (Math.abs(Number(x.toFixed(i)) - x) <= (Math.abs(x) * 0.0001)) return i;
        }
        return 12;
    };
    const precision = getPrecision(DX);

    // 4. 计算对齐后的边界
    // levelMin: 小于等于 tMin 的最大 DX 倍数
    const levelMin = Number((Math.floor(tMin / DX) * DX).toFixed(precision));
    // levelMax: 大于等于 tMax 的最小 DX 倍数
    const levelMax = Number((Math.ceil(tMax / DX) * DX).toFixed(precision));

    const levelnum = Math.round((levelMax - levelMin) / DX);
    const percentage = ((delta / (levelMax - levelMin)) * 100).toFixed(1) + "%";

    // 5. 生成最终序列
    const breaks = [];
    for (let i = 0; i <= levelnum; i++) {
        const val = levelMin + i * DX;
        // 使用 precision 消除 0.30000000000000004 这种浮点误差
        breaks.push(val.toFixed(precision));
    }

    return {
        levelMin,
        levelMax,
        step: DX,
        levelnum,
        percentage,
        breaks
    };
}