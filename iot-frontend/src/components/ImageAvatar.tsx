import Avatar from "@mui/material/Avatar";

interface Props {
  altText: string | undefined;
  imgUrl: string | null | undefined;
  width?: number | string | object;
  height?: number | string | object;
  variant?: "circular" | "rounded" | "square";
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
  width: string | number | object | undefined,
  height: string | number | object | undefined
) {
  const textName =
    name.split(" ").length > 1
      ? `${name.split(" ")[0][0].toUpperCase()}${name
          .split(" ")[1][0]
          .toUpperCase()}`
      : `${name.split(" ")[0][0].toUpperCase()}${name
          .split(" ")[0][1]
          .toUpperCase()}`;

  return {
    sx: {
      bgcolor: stringToColor(name),
      width: width,
      height: height,
    },
    children: textName,
  };
}

function ImageAvatar({ imgUrl, width, height, altText, variant }: Props) {
  if (imgUrl) {
    return (
      <Avatar
        alt={altText}
        src={imgUrl}
        variant={variant ? variant : "circular"}
        sx={{ width: width, height: height }}
      />
    );
  } else {
    return (
      <>
        {altText && altText !== " " && (
          <Avatar {...stringAvatar(altText, width, height)} />
        )}
      </>
    );
  }
}

export default ImageAvatar;
