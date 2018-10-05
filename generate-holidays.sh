#!/bin/bash

tmp=holi.js
holidays=holidays.js
current_year=$(date +%Y)

echo "{" > $tmp
for i in $(seq 0 32);
do
    year=$((current_year+i))
    if [[ $i != "0" ]]; then
        echo "," >> $tmp
    fi
    echo "\"$year\":" >> $tmp
    curl "https://feiertage-api.de/api/?jahr=$year&nur_land=HH" -s | jq "[.[]|.datum]" >> $tmp
done
echo "}" >> $tmp

echo "const HOLIDAYS =" > $holidays
jq -c . < $tmp >> $holidays
echo "export { HOLIDAYS }" >> $holidays
rm $tmp
