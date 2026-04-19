import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: "var(--tooltip-background)",
    color: "var(--tooltip-text)",
    fontSize: "0.8rem",
    borderRadius: "10px",
    padding: "8px 12px",
    boxShadow: theme.shadows[4],
  },
  [`& .MuiTooltip-arrow`]: {
    color: "var(--tooltip-background)",
  },
}));

function TooltipWrapper({ children, title, ...props }) {
  return (
    <CustomTooltip {...props} title={title}>
      {children}
    </CustomTooltip>
  );
}

export default TooltipWrapper;

