import mongoose from 'mongoose'

const researchSchema = new mongoose.Schema(
    {
        topic: {
            type: String,
            required: true,
            trim: true,
        },

        report: {
            type: String,
            required: true,
        },

        searchResults: {
            type: Array,
            default: [],
        },

        scrapedContent: {
            type: String,
            default: '',
        },

        feedback: {
            type: String,
            default: '',
        },

        statuses: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
)

const Research = mongoose.model('Research', researchSchema)

export default Research