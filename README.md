# chirp export analyzer

this is a simple utility to analyze a csv export of a chirp file. It's most useful for comparing the differences between two seperate Chirp csv exports.

## Usage

### Analyze a single chirp file for duplicates

```
./analyze chirp-export.csv
```

### Analyze a particular frequency is a single chrip file

This is useful when there are multiple channels sharing the same frequency.

```
./analyze chirp-export.csv 151.940000
```

### Compare Two Seperate exports against one another

```
./analyze chirp-export-1.csv chirp-export-2.csv
```

### Analyze a freqeuncy

This is useful when there is a shared and/or mismatched frequency.

```
./analyze chirp-export-1.csv chirp-export-2.csv 146.530000
```

### Environment Variables

```
DEBUG=0 ./analyze chirp-export-1.csv chirp-export-2.csv
```

This will disable debugging (enabled by default). Currently this is basically useless.

```
DEBUG=2 ./analyze chirp-export-1.csv chirp-export-2.csv
```

This will increase debugging verbosity.

```
IGNORE_POWER_DIFFERENCE=1 ./analyze chirp-export-1.csv chirp-export-2.csv
```

Usually there will be mismatches based on the power setting alone. When enabling this flag there should usually be less mismatches.

