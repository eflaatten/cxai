import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
    borderRadius: "8px",
    boxShadow: theme.shadows[3],
    padding: "8px 12px",
  },
  [`& .MuiTooltip-arrow`]: {
    color: theme.palette.background.paper,
  },
}));

const TooltipWrapper = ({ title, children, ...props }) => {
  return (
    <CustomTooltip title={title} arrow {...props}>
      {children}
    </CustomTooltip>
  );
};

export default TooltipWrapper;