import { Box, Text } from "@chakra-ui/react";

interface Props {
  code: string;
  count: number;
}

export const ColorCode = ({ code, count }: Props) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="center" marginBottom="8px">
      <Box
        width={30}
        height={30}
        backgroundColor={code}
        borderRadius="100%"
        mr="4px"
      />
      <Text fontSize="sm" marginBottom="4px">{`${code} : ${count} 회`}</Text>
    </Box>
  )
}