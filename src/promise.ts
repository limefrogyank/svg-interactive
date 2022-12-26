
export function readerGetTextAsync(reader:FileReader, file: File) : Promise<string> {
	reader.readAsText(file);
    return new Promise(function(resolve, reject) {
        reader.onload = ev => {
			resolve(reader.result as string);
		}
    });
}

