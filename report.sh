if ! [ -f ./test-reporter ]; then
  curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./test-reporter
fi

./test-reporter before-build
./test-reporter after-build -t lcov -r 04be083d70d80f09e5b73920f7ccf993773a9e442b7d5cb4694a280f62693976

