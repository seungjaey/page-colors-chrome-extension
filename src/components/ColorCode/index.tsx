import { Box, Text, Tooltip } from "@chakra-ui/react";

interface Props {
  code: string;
  count: number;
}

export const ColorCode = ({ code, count }: Props) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="center" marginBottom="8px">
      <Box mr="8px">
        <Tooltip label={code} fontSize="sm">
          <Box
            width={30}
            height={30}
            backgroundColor={code}
            borderRadius="100%"
          />
        </Tooltip>
      </Box>
      <Text fontSize="sm" marginBottom="4px">{`${count} 회`}</Text>
    </Box>
  )
}