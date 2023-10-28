import Avatar from "@mui/material/Avatar";

interface Props {
  altText: string;
  imgUrl: string | null | undefined;
  width?: number | string;
  height?: number | string;
}

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(
  name: string,
  width: string | number | undefined,
  height: string | number | undefined
) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: width,
      height: height,
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
}

function ImageAvatar({ imgUrl, width, height, altText }: Props) {
  if (imgUrl) {
    return (
      <Avatar
        alt={altText}
        src={imgUrl}
        sx={{ width: width, height: height }}
      />
    );
  } else {
    return (
      <>
        {altText !== " " && (
          <Avatar {...stringAvatar(altText, width, height)} />
        )}
      </>
    );
  }
}

export default ImageAvatar;
