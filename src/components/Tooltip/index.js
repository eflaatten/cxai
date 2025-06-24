import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme, ownerState }) => {
  const isDark = ownerState?.darkTheme;
  return {
    [`& .MuiTooltip-tooltip`]: {
      backgroundColor: isDark ? "#fff" : "#000",
      color: isDark ? "#000" : "#fff",
      fontSize: "0.875rem",
      borderRadius: "8px",
      boxShadow: theme.shadows[3],
      padding: "8px 12px",
    },
    [`& .MuiTooltip-arrow`]: {
      color: isDark ? "#fff" : "#000",
    },
  };
});

const TooltipWrapper = ({ title, children, darkTheme, ...props }) => {
  return (
    <CustomTooltip title={title} arrow {...props} ownerState={{ darkTheme }}>
      {children}
    </CustomTooltip>
  );
};

export default TooltipWrapper;
