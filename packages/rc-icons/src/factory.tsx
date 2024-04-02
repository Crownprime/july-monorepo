import React from 'react';

/** icon 的 props 和 span 相同 */
type IconProps = React.HTMLProps<HTMLSpanElement>;

type IconType = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<IconProps> & React.RefAttributes<HTMLSpanElement>
>;

const IconWrap = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
  return <span className="july-icon" ref={ref} {...props} />;
});

const factory = (Svg: React.FC<React.HTMLProps<SVGElement>>) =>
  React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => (
    <IconWrap {...props} ref={ref}>
      <Svg />
    </IconWrap>
  ));

export { factory, type IconType };
