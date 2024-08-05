import { Button } from "@mui/material"
import { fetchSignature } from "./utils/fetchSignature"

export default function TestButton() {
	return (
		<Button variant="contained" onClick={fetchSignature}>
			Test
		</Button>
	)
}
