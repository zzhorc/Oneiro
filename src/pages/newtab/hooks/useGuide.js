import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function useGuide() {
  useEffect(() => {
    const steps = [];
    if (localStorage.getItem("firstRun") !== "0") {
      steps.push(
        {
          element: "#theme-toggle",
          popover: {
            title: "使用引导：1/3 切换主题",
            description: "点击按钮切换主题，当前为跟随系统主题。",
            side: "top",
          },
        },
        {
          element: "#font-toggle",
          popover: {
            title: "使用引导：2/3 切换字体",
            description: "点击按钮切换你喜欢的字体，右下角也会实时显示当前字体名称。",
            side: "top",
          },
        },
        {
          element: "#poem-author-container",
          popover: {
            title: "使用引导：3/3 查询诗词详情",
            description: "点击这行文字，可以跳转搜索引擎查看这首诗词的详细信息及出处。",
            side: "top",
            align: "center",
          },
        }
      );
    }

    if (steps.length > 0) {
      const driverObj = driver({
        popoverOffset: 10,
        showProgress: true,
        progressText: "第{{current}}步，共{{total}}步",
        nextBtnText: "继续 →",
        prevBtnText: "← 上一步",
        doneBtnText: "完成",
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || confirm("强制关闭引导？后续将不再提示。")) {
            driverObj.destroy();
            localStorage.setItem("firstRun", "0");
            // 清理遗留的不必要的配置项
            localStorage.removeItem("update1voice");
          }
        },
        steps: steps,
      });
      driverObj.drive();
    }
  }, []);
} 