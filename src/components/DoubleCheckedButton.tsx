import { Button, ButtonProps, Popconfirm, PopconfirmProps, Tooltip, TooltipProps } from "antd";
import { PropsWithChildren } from "react";

export type DoubleCheckedButtonProps = {
  buttonProps: ButtonProps;
  tooltipProps?: TooltipProps;
  popconfirmProps: PopconfirmProps;
};

export default function DoubleCheckedButton(props: DoubleCheckedButtonProps & PropsWithChildren) {
  return (
    <Popconfirm {...props.popconfirmProps}>
      {
        props.tooltipProps
        ?
        <Tooltip {...props.tooltipProps}>
          <Button {...props.buttonProps}>{props.children}</Button>
        </Tooltip>
        :
        <Button {...props.buttonProps}>{props.children}</Button>
      }
    </Popconfirm>
  );
}