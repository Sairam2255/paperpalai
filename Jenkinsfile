
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Sairam2255/paperpalai.git'
            }
        }

        stage('Frontend CI') {
            steps {
                dir('client') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Backend Validation') {
            steps {
                dir('server') {
                    bat 'node --check server.js'
                }
            }
        }

        stage('Archive Build') {
            steps {
                archiveArtifacts artifacts: 'client/dist/**',
                                 fingerprint: true
            }
        }
    }
}
