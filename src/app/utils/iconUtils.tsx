declare const require: {
    context(directory: string, useSubdirectories?: boolean, regExp?: RegExp): {
      keys(): string[];
      <T>(id: string): T;
    };
  };
  
  function importAll(r: any): Record<string, any> {
    let images: Record<string, any> = {};
    r.keys().forEach((item: string, index: number) => {
      images[item.replace('./', '')] = r(item);
    });
    return images;
  }
  
  export function weatherIcon(imageName: string) {
    const allWeatherIcons: Record<string, any> = importAll(
      require.context('../assets/icons', false, /\.(png)$/)
    );
  
    const iconsKeys: string[] = Object.keys(allWeatherIcons);
  
    const iconsValues: any[] = Object.values(allWeatherIcons);
    const iconIndex: number = iconsKeys.indexOf(imageName);
  
    return iconsValues[iconIndex];
  }
  