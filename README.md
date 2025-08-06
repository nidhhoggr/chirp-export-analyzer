# Chirp Export Analyzer

this is a simple CLI script to analyze a csv export from the Chirp program. It's most useful for comparing the differences between two separate Chirp csv exports.

## Usage

### Analyze a single Chirp export for duplicates

```
./analyze chirp-export.csv
```

### Analyze a particular frequency in a single Chirp export file

This is useful when there are multiple channels sharing the same frequency.
```
./analyze chirp-export.csv --frequency=151.940000
```

### Compare two separate exports against one another

```
./analyze chirp-export-1.csv chirp-export-2.csv
```

### Analyze a frequency in either Chirp export files

This is useful when there is a shared and/or mismatched frequency.
```
./analyze chirp-export-1.csv chirp-export-2.csv --frequency=146.530000
```

### Environment Variables

This will disable debugging (enabled by default). Currently this is basically useless.
```
./analyze chirp-export-1.csv chirp-export-2.csv --debug=0
```

This will increase debugging verbosity.
```
./analyze chirp-export-1.csv chirp-export-2.csv --debug=2
```

Usually there will be mismatches based on the power setting alone. When enabling this environment variable, there should usually be less mismatches.
```
./analyze chirp-export-1.csv chirp-export-2.csv --ignore-power-difference=1
```


### Exports
The following command will analyze an export CSV file and create two files names export.csv and omitted.csv. The ommitted.csv will contain entries that a duplicates of a particular frequency.
```
 ./analyze --export-by=frequency --export-distinct --export-truncate --debug=0 chirp-export.csv
```


## NOTE

Mismatches only take into consideration every field besides the channel Location (this would more appoprirately be called the channel ID) and Name. As a result, channels with the same settings but a different channel name or number will *NOT* be considered a mismatch. The following list is the name of the columns exported from Chirp in their respective order:

 * Location
 * Name
 * Frequency
 * Duplex
 * Offset
 * Tone
 * rToneFreq
 * cToneFreq
 * DtcsCode
 * DtcsPolarity
 * RxDtcsCode
 * CrossMode
 * Mode
 * TStep
 * Skip
 * Power
 * Comment
 * URCALL
 * RPT1CALL
 * RPT2CALL
 * DVCODE
