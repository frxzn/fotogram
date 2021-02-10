import * as React from 'react';

interface Props {
  hexColor: string;
  width?: number;
  height?: number;
}

const SvgComponent: React.FC<Props> = ({ hexColor, width, height }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ? width : 512}
      height={height ? height : 512}
      viewBox="0 0 443.52 443.52"
    >
      <path
        d="M336.226 209.591l-204.8-204.8c-6.78-6.548-17.584-6.36-24.132.42-6.388 6.614-6.388 17.099 0 23.712l192.734 192.734-192.734 192.734c-6.663 6.664-6.663 17.468 0 24.132 6.665 6.663 17.468 6.663 24.132 0l204.8-204.8c6.663-6.665 6.663-17.468 0-24.132z"
        fill={hexColor}
        data-original="#000000"
        xmlns="http://www.w3.org/2000/svg"
      />
    </svg>
  );
};

export default SvgComponent;
